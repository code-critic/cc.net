using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using CC.Net.Attributes;
using cc.net.Dto;
using CC.Net.Collections;
using CC.Net.Controllers;
using cc.net.Docs;
using CC.Net.Dto;
using CC.Net.Entities;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using DiffPlex.DiffBuilder.Model;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using TypeLite;
using TypeLite.TsModels;
using YamlDotNet.Serialization;

namespace CC.Net
{
    public class Program
    {
        public static void Main(string[] args)
        {

            if (args.Length > 0 && args[0] == "--docs" || true.Equals(true))
            {
                Directory.CreateDirectory("docs/");
                var sections = new List<string>
                {
                    DocGeneration.For<CourseProblem>()
                };
                File.WriteAllText("docs/README.MD", sections.AsString("<br>\n"));
                return;
            }
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
                        .For<CcEvent>()
                        .For<CcDataAgg>()
                        .For<MarkSolutionItem>()
                        .For<TableRequest>()
                        .For<TableResponse>()
                        .For<SingleCourse>()
                        .For<ProcessStatus>()
                        .For<CommentServiceItem>()
                        .For<GradeDto>()
                        .For<StudentScoreboardCourse>()
                        .For<CcGroup>()

                        .For<DiffResult>()
                        .For<AppUser>()
                        .For<DiffResultComposite>()

                        .WithModuleNameFormatter((moduleName) => "")
                        .WithMemberFormatter((identifier) =>
                            char.ToLower(identifier.Name[0]) + identifier.Name.Substring(1)
                        )
                        .WithTypeFormatter((type, f) => "I" + ((TsClass)type).Name)
                        .Generate());

                var enumBase =
                        TypeScript.Definitions()
                            .For<ProcessStatusCodes>()
                            .For<ChangeType>()
                            .For<ProcessStatus>()
                            .For<CcEventType>()
                            .For<ProblemStatus>()
                            .For<SubmissionStatus>()
                            .For<CcUserGroupStatus>()

                            .WithModuleNameFormatter((moduleName) => "")
                            .WithMemberFormatter((identifier) =>
                                char.ToLower(identifier.Name[0]) + identifier.Name.Substring(1)
                            )
                            .WithTypeFormatter((type, f) => "I" + ((TsClass)type).Name)
                            .Generate();

                enumBase += AddEnumLike<ProcessStatus>();

                File.WriteAllText(
                    "_client/src/models/Enums.ts",
                    enumBase.Replace("export const enum", "export enum")
                );
                Environment.Exit(0);
            }

            CreateWebHostBuilder(args)
                .Build()
                .Run();
        }

        public static string AddEnumLike<T>()
            where T: class, IJson
        {
            var type = typeof(T);
            var fields = type.GetFields(BindingFlags.Public | BindingFlags.Static);
            var result = $"\texport class {type.Name}Static {{\n";
            foreach(var field in fields)
            {
                var value = field.GetValue(null);
                if(value is T)
                {
                    var isntance = value as T;
                    var row = $"public static {field.Name}: I{field.ReflectedType.Name}";
                    row += " = ";
                    Console.WriteLine(field);
                    row += isntance.AsJson();
                    row += ";\n";
                    result += $"\t\t{row}\n";
                }else if(value is IEnumerable<T>)
                {
                    var row = $"public static {field.Name}: I{field.ReflectedType.Name}[] = [";
                    var instance = value as IEnumerable<T>;
                    row += string.Join(", \n",
                        instance.Select(i => i.AsJson())
                    );
                    row += "]";
                    result += $"\t\t{row}\n";
                }

            }
            result += $"\t}} // end of {type.Name}Static";
            return result;
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