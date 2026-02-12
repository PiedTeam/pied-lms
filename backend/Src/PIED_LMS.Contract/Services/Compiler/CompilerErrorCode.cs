namespace PIED_LMS.Contract.Services.Compiler;

public static class CompilerErrorCode
{
    public const string CompileError = "COMPILE_ERROR";
    public const string RuntimeError = "RUNTIME_ERROR";
    public const string SegmentationFault = "SEGMENTATION_FAULT";
    public const string TimeLimitExceeded = "TIME_LIMIT_EXCEEDED";
    public const string MemoryLimitExceeded = "MEMORY_LIMIT_EXCEEDED";
    public const string OutputLimitExceeded = "OUTPUT_LIMIT_EXCEEDED";
    public const string StderrLimitExceeded = "STDERR_LIMIT_EXCEEDED";
    public const string FloatingPointException = "FLOATING_POINT_EXCEPTION";
    public const string InvalidRequest = "INVALID_REQUEST";
    public const string RateLimitExceeded = "RATE_LIMIT_EXCEEDED";
    public const string ServerBusy = "SERVER_BUSY";
    public const string WrongAnswer = "WRONG_ANSWER";
}
