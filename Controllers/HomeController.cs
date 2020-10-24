using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using CC.Net.Config;
using CC.Net.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace cc.net.Controllers
{
    [Authorize]
    [Route("home")]
    public class HomeController : Controller
    {
        private CryptoService _cryptoService;
        private UserService _userService;
        private AppOptions _appOptions;
        private readonly ILogger<HomeController> _logger;

        public HomeController(CryptoService cryptoService, UserService userService, AppOptions appOptions, ILogger<HomeController> logger)
        {
            _cryptoService = cryptoService;
            _userService = userService;
            _appOptions = appOptions;
            _logger = logger;
        }

        private string LoginUrl =>
            string.IsNullOrEmpty(_appOptions.ReturnUrl)
            ? $"{_appOptions.LoginUrl}"
            : $"{_appOptions.LoginUrl}?returnurl={_appOptions.ReturnUrl}";

        [HttpGet("whoami")]
        [AllowAnonymous]
        public AppUser Whoami()
        {
            var user = _userService.CurrentUser;
            if(user == null)
            {
                Console.Error.WriteLine(LoginUrl);
                Response.Redirect(LoginUrl);
                throw new Exception("Not authorized");
            }

            return user;
        }

        [Route("index")]
        public IActionResult Index()
        {
            // https://localhost:5001/home/index
            // https://localhost:5001/home/login
            return View();
        }
        
        [AllowAnonymous]
        [Route("login")]
        public IActionResult Login()
        {
            _logger.LogError(LoginUrl);
            _logger.LogError(_appOptions.ReturnUrl);
            return Redirect(LoginUrl);
        }
        
        [Route("logout")]
        public bool Logout()
        {
            // https://localhost:5001/Home/Logout
            HttpContext.SignOutAsync("CookieAuth");
            return true;
        }


        [AllowAnonymous]
        [Route("login/{*path}")]
        public async Task<IActionResult> LoginRequestAsync()
        {
            var data = Request.RouteValues["path"].ToString();
            var user = _cryptoService.Decrypt(data);

            Console.WriteLine(data);
            Console.WriteLine(user);
            Console.WriteLine(user.Eppn);
            Console.WriteLine(user.Affiliation);

            if (user != null)
            {
                await _userService.SignInAsync(HttpContext, user);
                return Redirect("/");
            }

            return Redirect("/Error");
        }
    }
}
