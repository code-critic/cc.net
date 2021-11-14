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
using Microsoft.Extensions.FileProviders;
using System.Linq;

namespace CC.Net
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            MongoDBConfig = Configuration.GetSection("MongoDB").Get<MongoDBConfig>();
            AppOptions = Configuration.Get<AppOptions>();
            var version = Directory.GetParent(Directory.GetCurrentDirectory()).Name;
            AppOptions.Version = Regex.IsMatch(version, @"[0-9]\.[0-9]\.[0-9]")
                ? version
                : AppOptions.Version;
            
            Console.WriteLine($"Version:        {AppOptions.Version}");
            Console.WriteLine($"CanProcess:     {AppOptions.CanProcess}");
            Console.WriteLine($"UseInMemoryDB:  {AppOptions.UseInMemoryDB}");
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
            services.AddSingleton<Courses>();
            services.AddHostedService<ProcessService>();
            services.AddHostedService<NotificationService>();
            services.AddHttpContextAccessor();

            if(AppOptions.UseInMemoryDB) {
                services.AddSingleton<IDbService, InMemoryDbService>();
            } else {
                services.AddScoped<IDbService, MongoDbService>();
            }

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
            var logger = serviceProvider.GetService<ILogger<Startup>>();
            app.UseSerilogRequestLogging();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });
            logger.LogWarning($"Using DbService {serviceProvider.GetService<IDbService>()}");
            UpdateResultStatus(serviceProvider);

            // var courses = serviceProvider.GetService<Courses>();
            // var a = courses.GetProblem("TST", "2019", "problem-1", "jan.hybs", false);
            // var b = courses.ForUser("jan.hybs", false);
            //
            // var aa = courses.AllYears;
            // var bb = courses.YearsForUser("jan.hybs", false);

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
            

            app.UseRouting();

            // who are you
            app.UseAuthentication();
            
            // are you allowed
            app.UseAuthorization();
            
            // add to log
            app.UseMiddleware<LogUserNameMiddleware>();

            app.UseStaticFiles(new StaticFileOptions(){
                FileProvider = new PhysicalFileProvider(AppOptions.CourseDir),
                RequestPath = "/S"
            });

            app.UseSpaStaticFiles();

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

        private void UpdateResultStatus(IServiceProvider serviceProvider)
        {
            var iDbService = serviceProvider.GetService<IDbService>();
            iDbService.Resolve().Match(
                async mongoDb => {
                    var filter = Builders<CcData>.Filter.Eq("result.status", (int) ProcessStatusCodes.Running);
                    var update = Builders<CcData>.Update.Set("result.status", (int) ProcessStatusCodes.InQueue);
                    mongoDb._data.UpdateMany(filter, update);
                },
                async inMemoryDb => {
                    var result = await inMemoryDb.Data.FindAsync(i => true);
                    result.Select(i => {
                        i.Result.Status = (int) ProcessStatusCodes.InQueue;
                        return i;
                    }).ToList();
                }
            );
        }
    }
}
