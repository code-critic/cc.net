using System.Collections.Generic;
using TypeLite;

namespace Cc.Net.Apis
{
    [TsClass]
    public class ApiListResponse<T>
    {


        public IEnumerable<T> Data { get; set; }
        public IEnumerable<ApiError> Errors { get; set; } = new List<ApiError>();

        public ApiListResponse()
        {
        }
        
        public ApiListResponse(IEnumerable<T> data)
        {
            Data = data;
        }
    }
}