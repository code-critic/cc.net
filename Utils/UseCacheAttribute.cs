using CC.Net.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace cc.net.Utils
{
    [AttributeUsage(AttributeTargets.Method)]
    public class UseCacheAttribute : Attribute, IAsyncActionFilter
    {
        private readonly TimeSpan _duration;
        private readonly bool _perUser;

        
        public UseCacheAttribute(int timeToLiveSeconds, bool perUser = false)
        {
            _duration = TimeSpan.FromSeconds(timeToLiveSeconds);
            _perUser = perUser;
        }
        
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var timer = Stopwatch.StartNew();
            var user = _perUser
                ? context.HttpContext.RequestServices.GetRequiredService<UserService>().CurrentUser.Id
                : "";

            var cacheKey = GenerateCacheKeyFromRequest(context.HttpContext.Request, user);
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<UseCacheAttribute>>();
            var cacheService = context.HttpContext.RequestServices.GetRequiredService<CacheContentService>();

            var cacheContent = cacheService.GetCache(cacheKey);
            if (cacheContent != null)
            {
                logger.LogInformation("Using cache for {url} in {time} ms", cacheKey, timer.ElapsedMilliseconds);
                context.Result = (IActionResult)cacheContent.Result;
                return;
            }

            var result = await next();
            if (result.Result is OkObjectResult)
            {
                cacheService.SaveCache(cacheKey, result.Result, _duration);
            }
            logger.LogInformation("Using live  for {url} in {time} ms", cacheKey, timer.ElapsedMilliseconds);
        }

        private string GenerateCacheKeyFromRequest(HttpRequest httpRequest, string user = "")
        {
            var builder = new StringBuilder();
            builder.Append(httpRequest.Path);
            builder.Append($"?user={user}");

            foreach (var (key, value) in httpRequest.Query.OrderBy(i => i.Key))
            {
                builder.Append($"&{key}={value}");
            }

            return builder.ToString();
        }
    }
}
