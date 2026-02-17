import { OperationState } from "./operations";
import "./OperationView.css";
import { Modal } from "./Modal";
import {
  FaCircleExclamation,
  FaCircleCheck,
  FaCircleMinus,
} from "react-icons/fa6";
import { useState } from "react";
import { toast } from "sonner";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Trans, useTranslation } from "react-i18next";

export default ({
  operationState,
  closeMenu,
}: {
  operationState: OperationState;
  closeMenu: () => void;
}) => {
  const { t } = useTranslation();
  const operation = operationState.current;
  const opFailed = operationState.failed.length > 0;
  const done =
    (opFailed &&
      operationState.started.length ==
      operationState.completed.length + operationState.failed.length) ||
    operationState.completed.length == operation.steps.length;

  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);

  return (
    <Modal
      isOpen={true}
      close={() => {
        if (done) closeMenu();
      }}
      hideClose={!done}
      sizeFit
    >
      <div className="operation-header">
        <h2>
          {done && !opFailed && operation.successTitleKey
            ? t(operation.successTitleKey)
            : t(operation.titleKey)}
        </h2>
        <p>
          {done
            ? opFailed
              ? t("operation.failed")
              : t("operation.completed")
            : t("operation.please_wait")}
        </p>
      </div>
      <div className="operation-content-container">
        <div className="operation-content">
          {operation.steps.map((step) => {
            let failed = operationState.failed.find((f) => f.stepId == step.id);
            let completed = operationState.completed.includes(step.id);
            let started = operationState.started.includes(step.id);
            let notStarted = !failed && !completed && !started;

            // a little bit gross but it gets the job done.
            let lines =
              failed?.extraDetails
                ?.split("\n")
                .filter((line) => line.includes("●")) ?? [];
            let errorShort =
              lines[lines.length - 1]?.replace(/●\s*/, "").trim() ?? "";

            return (
              <div className="operation-step" key={step.id}>
                <div className="operation-step-icon">
                  {failed && (
                    <FaCircleExclamation className="operation-error" />
                  )}
                  {!failed && completed && (
                    <FaCircleCheck className="operation-check" />
                  )}
                  {!failed && !completed && started && (
                    <div className="loading-icon" />
                  )}
                  {notStarted && !opFailed && <div className="waiting-icon" />}
                  {notStarted && opFailed && (
                    <FaCircleMinus className="operation-skipped" />
                  )}
                </div>

                <div className="operation-step-internal">
                  <p>{t(step.titleKey)}</p>
                  {failed && (
                    <>
                      <pre className="operation-extra-details">
                        {errorShort ?? failed.extraDetails.replace(/^\n+/, "")}
                      </pre>
                      <p
                        className="operation-more-details"
                        role="button"
                        tabIndex={0}
                        onClick={() => setMoreDetailsOpen(!moreDetailsOpen)}
                      >
                        {t("common.more_details")} {moreDetailsOpen ? "▲" : "▼"}
                      </p>
                      {moreDetailsOpen && (
                        <pre className="operation-extra-details">
                          {failed.extraDetails.replace(/^\n+/, "")}
                        </pre>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {done && !opFailed && operation.successMessageKey && (
        <p className="operation-success-message">{t(operation.successMessageKey!)}</p>
      )}
      {done && !(!opFailed && operation.successMessageKey) && <p></p>}
      {opFailed && done && (
        <>
          <p style={{ margin: "1.25rem 0 0.5rem 0" }}>
            <Trans
              i18nKey="error.support_message"
              components={{
                discord: (
                  <span
                    onClick={() => openUrl("https://discord.gg/gjH8RaqhMr")}
                    role="link"
                    className="error-link"
                  />
                ),
                github: (
                  <span
                    onClick={() =>
                      openUrl("https://github.com/nab138/iloader/issues")
                    }
                    role="link"
                    className="error-link"
                  />
                ),
              }}
            />
          </p>
          <button
            style={{ marginBottom: "1.25rem", width: "100%" }}
            className="action-button primary"
            onClick={() => {
              navigator.clipboard.writeText(
                operationState.failed[0]?.extraDetails?.replace(/^\n+/, "") ??
                t("common.no_error"),
              );
              toast.success(t("common.copied_success"));
            }}
          >
            {t("operation.copy_error_clipboard")}
          </button>
        </>
      )}
      {done && (
        <button style={{ width: "100%" }} onClick={closeMenu}>
          {t("common.dismiss")}
        </button>
      )}
    </Modal>
  );
};
