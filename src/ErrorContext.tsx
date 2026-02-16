import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { Modal } from "./components/Modal";
import "./ErrorContext.css";
import { toast } from "sonner";
import { openUrl } from "@tauri-apps/plugin-opener";

export const ErrorContext = createContext<{
    err: (msg: string, err: string | null) => string;
}>({ err: () => "" });

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [simpleError, setSimpleError] = useState<string | null>(null);
    const [moreDetailsOpen, setMoreDetailsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!error) {
            setSimpleError(null);
            return;
        }
        // a little bit gross but it gets the job done.
        let lines = error?.split("\n").filter(line => line.includes("●")) ?? [];
        console.log(lines)
        if (lines.length > 0) {
            setSimpleError(lines[lines.length - 1].replace(/●\s*/, ""));
        }
    }, [error]);

    return (
        <ErrorContext.Provider value={{
            err: (msg: string, err: string | null) => {
                setMsg(msg);
                setError(err);
                setMoreDetailsOpen(false);
                return msg;
            }
        }}>
            <Modal forceTop isOpen={error !== null || msg !== null} close={() => {
                setError(null);
                setMsg(null);
                setMoreDetailsOpen(false);
            }}>
                <div className="error-outer">
                    <div className="error-header">
                        <h2>An Error Occured: {msg ?? "Unknown"}</h2>
                        <button onClick={() => {
                            navigator.clipboard.writeText(error?.replace(/^\n+/, "") ?? "No error");
                            toast.success("Logs copied to clipboard");
                        }}>Copy to clipboard</button>
                    </div>
                    {simpleError && <pre className="error-inner">
                        {simpleError}
                    </pre>}
                    <p>If the issue persists, press "Copy to clipboard" and send the copied error to the <span onClick={() => openUrl("https://discord.gg/gjH8RaqhMr")} role="link" className="error-link">Discord</span> or a <span onClick={() => openUrl("https://github.com/nab138/iloader/issues")} role="link" className="error-link">GitHub issue</span> for support.</p>
                    {simpleError && <p className="error-more-details" role="button" tabIndex={0} onClick={() => setMoreDetailsOpen(!moreDetailsOpen)}>
                        More Details {moreDetailsOpen ? "▲" : "▼"}
                    </p>}
                    {simpleError && !moreDetailsOpen && <pre className="error-inner error-details-measure">
                        {error?.replace(/^\n+/, "")}
                    </pre>}
                    {(moreDetailsOpen || !simpleError) && <pre className="error-inner error-details">
                        {error?.replace(/^\n+/, "")}
                    </pre>}
                    <button onClick={() => {
                        setError(null);
                        setMsg(null);
                    }}>
                        Dismiss
                    </button>
                </div>
            </Modal>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => {
    return useContext(ErrorContext);
};