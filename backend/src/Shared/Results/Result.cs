namespace JobTracker.Shared.Results;

/// <summary>
/// Represents a successful outcome with a value, or a failure with an error message.
/// </summary>
public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; }
    public T? Value { get; }

    private Result(bool isSuccess, string error, T? value)
    {
        IsSuccess = isSuccess;
        Error = error;
        Value = value;
    }

    /// <summary>Successful result carrying <paramref name="value"/>.</summary>
    public static Result<T> Success(T value) => new(true, string.Empty, value);

    /// <summary>Failed result with an error message.</summary>
    public static Result<T> Failure(string error) => new(false, error, default);
}
