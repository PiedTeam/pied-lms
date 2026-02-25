namespace PIED_LMS.Contract.Services.Compiler;

[JsonConverter(typeof(OptimizationLevelJsonConverter))]
public readonly record struct OptimizationLevel(string Value)
{
    public bool IsValid => Value is "0" or "1" or "2" or "3" or "s";

    public string ToGccFlag() => Value == "s" ? "-Os" : $"-O{Value}";
}

public sealed class OptimizationLevelJsonConverter : JsonConverter<OptimizationLevel>
{
    public override OptimizationLevel Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out var intValue))
            return new OptimizationLevel(intValue.ToString());

        if (reader.TokenType != JsonTokenType.String) return new OptimizationLevel(string.Empty);
        var value = reader.GetString();
        return value is null ? new OptimizationLevel(string.Empty) : new OptimizationLevel(value);

    }

    public override void Write(Utf8JsonWriter writer, OptimizationLevel value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.Value);
}
