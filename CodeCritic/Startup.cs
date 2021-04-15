using Cc.Net;
using Cc.Net.Controllers;
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
using Cc.Net.Services.Processing.Evaluation;
using MongoDB.Bson;
using MongoDB.Driver;
using Serilog;
using System.IO;
using System.Text.RegularExpressions;

namespace CC.Net
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            MongoDBConfig = Configuration.GetSection("MongoDB").Get<MongoDBConfig>();
            AppOptions = Configuration.Get<AppOptions>();
            Console.WriteLine(AppOptions.CanProcess);
            var version = Directory.GetParent(Directory.GetCurrentDirectory()).Name;
            AppOptions.Version = Regex.IsMatch(version, @"[0-9]\.[0-9]\.[0-9]")
                ? version
                : AppOptions.Version;
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
            services.AddScoped<EvaluationService>();
            services.AddSingleton<CacheContentService>();
            services.AddSingleton<NotificationFlag>();
            services.AddSingleton<ServerStatus>();
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
            services.AddSwaggerGen();

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
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });
            
            var dbService = serviceProvider.GetService<DbService>();
            var filter = Builders<CcData>.Filter.Eq("result.status", (int) ProcessStatusCodes.Running);
            var update = Builders<CcData>.Update.Set("result.status", (int) ProcessStatusCodes.InQueue);
            dbService.Data.UpdateMany(filter, update);


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
