using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;

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

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();
            services.AddSingleton(MongoDBConfig);
            services.AddSingleton(AppOptions);
            services.AddScoped<LanguageService>();
            services.AddScoped<CourseService>();
            services.AddScoped<DbService>();
            services.AddControllersWithViews();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "_client/build";
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IServiceProvider serviceProvider)
        {
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

            var db = serviceProvider.GetService<DbService>();
            var c = serviceProvider.GetService<CourseService>();

            Console.WriteLine(c["ADA"]["2019"]["04-palindrom-number"]["case-1.s"].random);

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "_client";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
