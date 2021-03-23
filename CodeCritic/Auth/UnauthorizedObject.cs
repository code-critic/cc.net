using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace cc.net.Auth
{
    public class UnauthorizedObject : ObjectResult
    {
        private const int DefaultStatusCode = StatusCodes.Status203NonAuthoritative;

        public UnauthorizedObject(string redirect) :
            base(new
            {
                redirect = redirect,
                error = DefaultStatusCode,
                message = "Unauthorized"
            })
        {
            StatusCode = DefaultStatusCode;
        }
    }
}