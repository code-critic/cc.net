using cc.net;
using cc.net.Controllers;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Hubs;
using CC.Net.Services;
using CC.Net.Services.Matlab;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using CC.Net.Collections;
using Cc.Net.Middlewares;
using Cc.Net.Services;
using MongoDB.Bson;
using MongoDB.Driver;
using Serilog;

namespace CC.Net
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            MongoDBConfig = Configuration.GetSection("MongoDB").Get<MongoDBConfig>();
            AppOptions = Configuration.Get<AppOptions>();
        }

        public IConfiguration Configuration { get; set; }
        public MongoDBConfig MongoDBConfig { get; set; }
        public AppOptions AppOptions { get; set; }

        public static IServiceProvider ServiceProvider { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();
            services.AddSingleton(MongoDBConfig);
            services.AddSingleton(AppOptions);
            services.AddSingleton<IdService>();
            services.AddSingleton<MatlabServer>();
            services.AddScoped<LanguageService>();
            services.AddScoped<CourseService>();
            services.AddScoped<DbService>();
            services.AddScoped<ProblemDescriptionService>();
            services.AddScoped<CompareService>();
            services.AddScoped<CryptoService>();
            services.AddScoped<UserService>();
            services.AddScoped<UtilService>();
            services.AddScoped<ViewResultService>();
            services.AddScoped<SubmitSolutionService>();
            services.AddSingleton<CacheContentService>();
            services.AddSingleton<NotificationFlag>();
            services.AddHostedService<ProcessService>();
            services.AddHostedService<NotificationService>();
            services.AddHttpContextAccessor();

            services.AddAuthentication("CookieAuth")
                .AddCookie("CookieAuth", config =>
                {
                    config.Cookie.Name = "CC.Cookie";
                    config.LoginPath = $"/Home/{nameof(HomeController.Login)}";
                });

            services.AddControllersWithViews();
            services.AddSignalR();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "_client/build";
            });
        }

        private static void WaitForKey (ConsoleKey key)
        {
            while (true)
            {
                if (Console.ReadKey(true).Key == key)
                {
                    break;
                }
            }
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IServiceProvider serviceProvider, IHostApplicationLifetime applicationLifetime)
        {
            ServiceProvider = serviceProvider;
            app.UseSerilogRequestLogging();
            var logger = serviceProvider.GetService<ILogger<Startup>>();
            var hub = serviceProvider.GetService<IHubContext<LiveHub>>();
            var dbService = serviceProvider.GetService<DbService>();

            var filter = Builders<CcData>.Filter.Eq("result.status", (int) ProcessStatusCodes.Running);
            var update = Builders<CcData>.Update.Set("result.status", (int) ProcessStatusCodes.InQueue);
            var items = dbService.Data.UpdateMany(filter, update);

            // var crypto = serviceProvider.GetService<CryptoService>();
            // Console.WriteLine(
            //     crypto.Encrypt("{\"eppn\": \"foo.bara@tul.cz\", \"affiliation\": \"root@tul.cz;member@tul.cz;employee@tul.cz;alum@tul.cz;faculty@tul.cz\"}")
            // );
            
            // new Thread (async () =>
            // {
            //     WaitForKey(ConsoleKey.Escape);
            //     logger.LogWarning("Press escape again to shutdown the server");
            //     WaitForKey(ConsoleKey.Escape);
                
            //     logger.LogWarning("Application is stopping...");
                
            //     // restart server in 1 min
            //     await hub.Clients.All
            //         .ServerMessageToClient("error", $"Server will be updated soon.", "Server shutting down", 60_000*1);
            //     applicationLifetime.StopApplication();
            // }).Start();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // 30 days, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            // who are you
            app.UseAuthentication();
            
            // add to log
            app.UseMiddleware<LogUserNameMiddleware>();

            // are you allowed
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapHub<LiveHub>("/live");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "_client";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                    // spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
                }
            });
        }
    }
}
