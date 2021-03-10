using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace cc.net.Extensions
{
    public static class IEnumerableExtensions
    {
        public static async Task ForEachAsync<T>(this List<T> list, Func<T, Task> func)
        {
            foreach (var value in list)
            {
                await func(value);
            }
        }
    }
}
