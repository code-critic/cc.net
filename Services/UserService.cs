using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using CC.Net.Config;

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

        public AppUser FromPrincipal(ClaimsPrincipal principal)
        {
            if(principal is null) {
                return Guest;
            }
            var user = new AppUser{
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