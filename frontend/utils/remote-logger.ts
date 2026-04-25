import { axiosGeneral as axios } from "@/common/axios";

type LogLevel = 'Information' | 'Warning' | 'Error' | 'Debug';

interface LogPayload {
  message: string;
  level: LogLevel;
  context?: string;
  stackTrace?: string;
}

const sendLog = async (payload: LogPayload) => {
  try {
    // Send log to our backend bridge endpoint
    // We don't await this as it should not block UI flow
    axios.post("/logs/frontend", payload).catch(() => {
        // Fail silently to avoid infinite loops or impacting user experience
    });
  } catch {
    // Fail silently
  }
};

/**
 * Utility to send logs from Frontend to the remote Loki server via Backend bridge.
 */
export const remoteLogger = {
  info: (message: string, context?: any) => 
    sendLog({ 
        message, 
        level: 'Information', 
        context: context ? JSON.stringify(context, null, 2) : undefined 
    }),
  warn: (message: string, context?: any) => 
    sendLog({ 
        message, 
        level: 'Warning', 
        context: context ? JSON.stringify(context, null, 2) : undefined 
    }),
  error: (message: string, error?: Error | any) => 
    sendLog({ 
      message, 
      level: 'Error', 
      context: typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error),
      stackTrace: error instanceof Error ? error.stack : undefined 
    }),
  debug: (message: string, context?: any) => 
    sendLog({ 
        message, 
        level: 'Debug', 
        context: context ? JSON.stringify(context, null, 2) : undefined 
    }),
};
