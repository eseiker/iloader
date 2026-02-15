use std::path::PathBuf;

use crate::{
    account::SideloaderMutex,
    device::{get_provider, DeviceInfoMutex},
    operation::Operation,
    pairing::{get_sidestore_info, place_pairing},
};
use isideload::sideload::application::SpecialApp;
use tauri::{AppHandle, Manager, State, Window};

pub async fn sideload(
    device_state: State<'_, DeviceInfoMutex>,
    sideloader_state: State<'_, SideloaderMutex>,
    app_path: String,
) -> Result<Option<SpecialApp>, String> {
    let device = {
        let device_lock = device_state.lock().unwrap();
        match &*device_lock {
            Some(d) => d.clone(),
            None => return Err("No device selected".to_string()),
        }
    };

    let provider = get_provider(&device).await?;

    let mut sideloader = {
        let mut sideloader_guard = sideloader_state.lock().unwrap();
        match sideloader_guard.take() {
            Some(s) => s,
            None => return Err("Not logged in".to_string()),
        }
    };

    let result = async {
        sideloader
            .install_app(&provider, app_path.into(), false)
            .await
            .map_err(|e| e.to_string())
    }
    .await;

    {
        let mut sideloader_guard = sideloader_state.lock().unwrap();
        *sideloader_guard = Some(sideloader);
    }

    result
}

#[tauri::command]
pub async fn sideload_operation(
    window: Window,
    device_state: State<'_, DeviceInfoMutex>,
    sideloader_state: State<'_, SideloaderMutex>,
    app_path: String,
) -> Result<(), String> {
    let op = Operation::new("sideload".to_string(), &window);
    op.start("install")?;
    op.fail_if_err(
        "install",
        sideload(device_state, sideloader_state, app_path).await,
    )?;
    op.complete("install")?;
    Ok(())
}

#[tauri::command]
pub async fn install_sidestore_operation(
    handle: AppHandle,
    window: Window,
    device_state: State<'_, DeviceInfoMutex>,
    sideloader_state: State<'_, SideloaderMutex>,
    nightly: bool,
    live_container: bool,
) -> Result<(), String> {
    let op = Operation::new("install_sidestore".to_string(), &window);
    op.start("download")?;
    // TODO: Cache & check version to avoid re-downloading
    let (filename, url) = if live_container {
        if nightly {
            ("LiveContainerSideStore-Nightly.ipa", "https://github.com/LiveContainer/LiveContainer/releases/download/nightly/LiveContainer+SideStore.ipa")
        } else {
            ("LiveContainerSideStore.ipa", "https://github.com/LiveContainer/LiveContainer/releases/latest/download/LiveContainer+SideStore.ipa")
        }
    } else if nightly {
        (
            "SideStore-Nightly.ipa",
            "https://github.com/SideStore/SideStore/releases/download/nightly/SideStore.ipa",
        )
    } else {
        (
            "SideStore.ipa",
            "https://github.com/SideStore/SideStore/releases/latest/download/SideStore.ipa",
        )
    };

    let dest = handle
        .path()
        .temp_dir()
        .map_err(|e| format!("Failed to get temp dir: {:?}", e))?
        .join(filename);
    op.fail_if_err("download", download(url, &dest).await)?;
    op.move_on("download", "install")?;
    let device = {
        let device_guard = device_state.lock().unwrap();
        match &*device_guard {
            Some(d) => d.clone(),
            None => return op.fail("install", "No device selected".to_string()),
        }
    };
    op.fail_if_err(
        "install",
        sideload(
            device_state,
            sideloader_state,
            dest.to_string_lossy().to_string(),
        )
        .await,
    )?;
    op.move_on("install", "pairing")?;
    let sidestore_info = op.fail_if_err(
        "pairing",
        get_sidestore_info(device.clone(), live_container).await,
    )?;
    if let Some(info) = sidestore_info {
        op.fail_if_err(
            "pairing",
            place_pairing(device, info.bundle_id, info.path).await,
        )?;
    } else {
        return op.fail(
            "pairing",
            "Could not find SideStore's bundle ID".to_string(),
        );
    }

    op.complete("pairing")?;
    Ok(())
}

pub async fn download(url: impl AsRef<str>, dest: &PathBuf) -> Result<(), String> {
    let response = reqwest::get(url.as_ref())
        .await
        .map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!(
            "Failed to download file: HTTP {}",
            response.status()
        ));
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    tokio::fs::write(dest, &bytes)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
