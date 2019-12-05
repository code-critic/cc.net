using System;
using System.IO;
using CC.Net.Collections;
using CC.Net.Dto;
using CC.Net.Entities;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using DiffPlex.DiffBuilder.Model;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using TypeLite;

namespace CC.Net
{
    public class Program
    {
        public static void Main(string[] args)
        {
            if (args.Length > 0 && args[0] == "--generate")
            {
                Directory.CreateDirectory("_client/src/models/");
                File.WriteAllText(
                    "_client/src/models/DataModel.d.ts",
                    TypeScript.Definitions()
                        .For<User>()
                        .For<Language>()
                        .For<Course>()
                        .For<CcData>()
                        .For<CcDataAgg>()
                        .For<MarkSolutionItem>()
                        .For<TableRequest>()
                        .For<TableResponse>()

                        .For<DiffResult>()

                        .WithModuleNameFormatter((moduleName) => "")
                        .WithMemberFormatter((identifier) => 
                            Char.ToLower(identifier.Name[0]) + identifier.Name.Substring(1)
                        )
                        .WithTypeFormatter((type, f) => "I" + ((TypeLite.TsModels.TsClass)type).Name)
                        .Generate());
                System.Environment.Exit(0);
            }

            CreateWebHostBuilder(args)
                .Build()
                .Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.secret.json", optional: true)
            .AddCommandLine(args)
            .Build();

            return WebHost.CreateDefaultBuilder(args)
                .UseConfiguration(config)
                .UseStartup<Startup>();
        }
    }
}
;