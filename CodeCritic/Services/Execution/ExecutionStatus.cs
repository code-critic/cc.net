namespace Cc.Net.Services.Execution
{
    public enum ExecutionStatus
    {
        FatalError = 1,
        NoSuchFile = 2,
        Ok = 3,
        OkTimeout = 4,
        Error = 5,
        ErrorTimeout = 6,
        GlobalTimeout = 7,
    }
}