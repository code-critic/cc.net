using System;
using System.Linq;

namespace Cc.Net.Extensions
{
    public static class GenericExtensions
    {
        public static bool AnyOf<T>(this T item, params T[] items)
        {
            return items.Any(i => i.Equals(item));
        }
        
        public static TEnum ParseOrDefault<TEnum>(this string value, TEnum def) where TEnum : struct
        {
            bool success = Enum.TryParse(value, true, out TEnum result);
            return success ? result : def;
        }
    }
}