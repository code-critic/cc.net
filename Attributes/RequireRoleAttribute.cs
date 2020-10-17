using CC.Net.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace CC.Net.Attributes
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class RequireRoleAttribute : AuthorizeAttribute, IAuthorizationFilter
    {
        public string Role { get; set; } = AppUserRoles.Root;

        public RequireRoleAttribute()
        {

        }
        public RequireRoleAttribute(string role)
        {
            Role = role;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var http = context.HttpContext as DefaultHttpContext;
            using (var scope = http.ServiceScopeFactory.CreateScope())
            {
                var userService = scope.ServiceProvider.GetService<UserService>();
                if (!userService.HasRole(Role))
                {
                    context.Result = new StatusCodeResult((int)System.Net.HttpStatusCode.Forbidden);
                    return;
                }
            }
        }
    }
}
