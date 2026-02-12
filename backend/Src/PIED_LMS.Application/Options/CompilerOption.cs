using System.ComponentModel.DataAnnotations;

namespace PIED_LMS.Application.Options;

public class CompilerOption
{
    [Range(1, int.MaxValue)]
    public int ContainerPoolSize { get; set; } = 4;

    [Range(1, int.MaxValue)]
    public int MaxConcurrentCompilations { get; set; } = 4;

    [Range(1, int.MaxValue)]
    public int SemaphoreWaitTimeoutMs { get; set; } = 2000;

    [Required]
    public string ContainerNamePrefix { get; set; } = "compiler-";

    [Required]
    public string ContainerImage { get; set; } = "gcc:13";

    [Required]
    public string ContainerWorkDir { get; set; } = "/workspace";

    [Required]
    public string ContainerNetwork { get; set; } = "none";

    [Range(0.1, 64)]
    public double ContainerCpuLimit { get; set; } = 1;

    [Range(1, int.MaxValue)]
    public int ContainerMemoryLimitMb { get; set; } = 256;

    [Range(1, int.MaxValue)]
    public int ContainerMemorySwapMb { get; set; } = 256;

    [Range(1, int.MaxValue)]
    public int ContainerPidsLimit { get; set; } = 64;

    public bool ContainerReadOnlyRootFs { get; set; } = true;

    [Required]
    public string ContainerTmpfsMount { get; set; } = "/workspace:rw,nodev,nosuid,size=100m,exec";

    [Range(1, int.MaxValue)]
    public int DefaultTimeLimitMs { get; set; } = 5000;

    [Range(1, int.MaxValue)]
    public int DefaultMemoryLimitMb { get; set; } = 256;

    [Range(1, int.MaxValue)]
    public int OutputLimitBytes { get; set; } = 1_048_576;

    [Range(1, int.MaxValue)]
    public int StderrLimitBytes { get; set; } = 262_144;

    [Required]
    public string CompileSuccessMarker { get; set; } = "__COMPILE_SUCCESS__";

    [Required]
    public string TestCaseBasePath { get; set; } = "/testcases";

    [Required]
    public string GccStandard { get; set; } = "c11";
}
