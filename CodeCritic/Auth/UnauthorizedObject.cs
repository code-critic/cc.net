using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Cc.Net.Auth
{

    public class UnauthorizedObjectIface {
        public string Redirect { get; set; }
        public int Error { get; set; }
        public string Message { get; set; }
    }
    public class UnauthorizedObject : ObjectResult
    {
        private const int DefaultStatusCode = StatusCodes.Status203NonAuthoritative;

        public UnauthorizedObject(string redirect) :
            base(new UnauthorizedObjectIface
            {
                Redirect = redirect,
                Error = DefaultStatusCode,
                Message = "Unauthorized"
            })
        {
            StatusCode = DefaultStatusCode;
        }
    }
}