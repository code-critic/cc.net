using System.Collections.Generic;
using TypeLite;

namespace Cc.Net.Apis
{
    [TsClass]
    public class ApiResponse<T>
    {
        public T Data { get; set; }
        public IEnumerable<ApiError> Errors { get; set; } = new List<ApiError>();

        public ApiResponse() { }

        public ApiResponse(T data)
        {
            Data = data;
        }

    }
}