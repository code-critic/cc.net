using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Serilog.Context;

namespace Cc.Net.Middlewares
{
    public class LogUserNameMiddleware
    {
        private readonly RequestDelegate next;

        public LogUserNameMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public Task Invoke(HttpContext context)
        {
            var id = (context.User.Identity as ClaimsIdentity)?.Claims
                .FirstOrDefault(i => i.Type == ClaimTypes.NameIdentifier)?.Value ?? "guest";
            LogContext.PushProperty("UserName", id);

            return next(context);
        }
    }
}