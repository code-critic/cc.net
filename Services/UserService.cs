using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using CC.Net.Config;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;

namespace CC.Net.Services
{
    public class UserService
    {
        private IServiceProvider _serviceProvider;
        private AppOptions _appOptions;

        private readonly AppUser Guest = null;

        public UserService(IServiceProvider serviceProvider, AppOptions appOptions)
        {
            _serviceProvider = serviceProvider;
            _appOptions = appOptions;
        }

        public async Task SignInAsync(HttpContext HttpContext, AppUser user)
        {
            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(nameof(user.Affiliation), user.Affiliation),
                    new Claim(nameof(user.Eppn), user.Eppn),
                };

            var identity = new ClaimsIdentity(claims, "TUL Identity");
            var userPrincipal = new ClaimsPrincipal(new[] { identity });
            await HttpContext.SignInAsync(userPrincipal);
        }

        public AppUser FromPrincipal(ClaimsPrincipal principal)
        {
            if(principal == null || principal.Claims == null || string.IsNullOrEmpty(principal.FindFirstValue(nameof(AppUser.Eppn)))) {
                return Guest;
            }

            var user = new AppUser {
                Eppn = principal.FindFirstValue(nameof(AppUser.Eppn)),
                Affiliation = principal.FindFirstValue(nameof(AppUser.Affiliation)),
            };

            if(_appOptions.Admins.Contains(user.Id))
            {
                user.Elevate();
            }
            return user;
        }

        public ClaimsPrincipal CurrentPrincipal
        {
            get
            {
                try
                {
                    return _serviceProvider.GetService<IHttpContextAccessor>()
                        .HttpContext.User;
                }
                catch (Exception ex)
                {
                    return null;
                }

            }
        }

        public AppUser CurrentUser => FromPrincipal(CurrentPrincipal);
    }
}