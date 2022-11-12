var lst = new List<int>() { 1, 2, 3 };
var lin = lst
    .Select(i => i * 2)
    .ToArray();

Console.WriteLine($"C# dotnet is working fine! {lin[2]}");