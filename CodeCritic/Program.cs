using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Cc.Net.Apis;
using Cc.Net.Dto;
using CC.Net.Collections;
using CC.Net.Controllers;
using Cc.Net.Docs;
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
using Serilog;
using TypeLite;
using TypeLite.TsModels;
using Cc.Net.Auth;

namespace CC.Net
{

    public static class TsGeneratorExtensions
    {

        public static TypeScriptFluent RegisterTypeConvertor(this TypeScriptFluent fluent, Type a, TypeConvertor b)
        {
            var sg = fluent.ScriptGenerator;
            var flags = BindingFlags.NonPublic | BindingFlags.GetField | BindingFlags.Instance;
            var typeConvertorsField = typeof(TsGenerator).GetField("_typeConvertors", flags);
            var typeConvertors = (TypeConvertorCollection) typeConvertorsField?.GetValue(sg);

            var convertorsField = typeof(TypeConvertorCollection).GetField("_convertors", flags);
            var convertors = (Dictionary<Type, TypeConvertor>) convertorsField?.GetValue(typeConvertors);
            convertors?.Add(a, b);

            return fluent;
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            if (args.Length > 0 && args[0] == "--docs" || true.Equals(false))
            {
                var docs = "../docs/";
                Directory.CreateDirectory(docs);
                var sections = new List<string>
                {
                    DocGeneration.For<CourseProblem>(),
                    DocGeneration.For<CourseProblemCollaborationConfig>(),
                    DocGeneration.For<CourseProblemCase>(),
                    DocGeneration.For<CourseReference>(),
                };
                File.WriteAllText($"{docs}/README.md", sections.AsString("\n\n\n"));
                return;
            }

            if (args.Length > 0 && args[0] == "--generate")
            {

                var enumImports = new List<Type>{
                    typeof(ProcessStatus),
                    typeof(SubmissionStatus),
                    typeof(ProblemType),
                    typeof(ProblemStatus),
                    typeof(CcEventType),
                    typeof(CcUserGroupStatus),
                    typeof(DiffResultLineType),
                    typeof(ProcessStatusCodes),
                    typeof(ChangeType),
                };

                Directory.CreateDirectory("_client/src/models/");
                var destModelPath = "_client/src/models/DataModel.d.ts";
                var modelDefinitions = TypeScript.Definitions();

                enumImports.ForEach(T =>
                {
                    modelDefinitions = modelDefinitions.RegisterTypeConvertor(T, i => T.Name);
                });

                modelDefinitions = modelDefinitions
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
                        .For<UnauthorizedObjectIface>()
                        .For<SimpleFileDto>()

                        .For<ApiError>()
                        .For<CcDataDto>()
                        .For<CcDataLight>()

                        .For<DiffResult>()
                        .For<AppUser>()
                        .For<DiffResultComposite>();
                        
                var destModel = modelDefinitions
                        .WithModuleNameFormatter((moduleName) => "")
                        .WithMemberFormatter((identifier) =>
                            char.ToLower(identifier.Name[0]) + identifier.Name.Substring(1)
                        )
                        .WithTypeFormatter((type, f) => "I" + ((TsClass)type).Name)
                        .Generate();

                var importLine = $"import {{ {enumImports.Select(i => i.Name).AsString(", ")} }} from  './Enums'";
                var dateLine = $"// generated at {DateTime.Now.ToUniversalTime()} (UTC)";
                var guidLine = $"export const __uuid = '{Guid.NewGuid()}'";
                File.WriteAllText(destModelPath, $"{importLine}\n{destModel}\n\n{dateLine}\n{guidLine}");

                var enumDefinition = TypeScript.Definitions();
                enumImports.ForEach(T =>
                {
                    enumDefinition = enumDefinition.For(T);
                });

                var enumBase = enumDefinition
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
            where T : class, IJson
        {
            var type = typeof(T);
            var fields = type.GetFields(BindingFlags.Public | BindingFlags.Static);
            var result = $"\texport class {type.Name}Static {{\n";
            foreach (var field in fields)
            {
                var value = field.GetValue(null);
                if (value is T)
                {
                    var instance = value as T;
                    var row = $"public static {field.Name}: I{field.ReflectedType.Name}";
                    row += " = ";
                    Console.WriteLine(field);
                    row += instance.AsJson();
                    row += ";\n";
                    result += $"\t\t{row}\n";
                }
                else if (value is IEnumerable<T>)
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
                .UseSerilog((builder, options) =>
                {
                    options.Enrich.FromLogContext();


                    var logFormat = "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] [{UserName}] {Message:lj}{NewLine}{Exception}";
                    options.WriteTo.Console(outputTemplate: logFormat)
                        .MinimumLevel.Override("Default", Serilog.Events.LogEventLevel.Information)
                        .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Serilog.AspNetCore.RequestLoggingMiddleware", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Microsoft.AspNetCore.Mvc.Internal", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Microsoft.AspNetCore.Authentication", Serilog.Events.LogEventLevel.Warning);

                    options.WriteTo.File("app.log", outputTemplate: logFormat)
                        .MinimumLevel.Override("Default", Serilog.Events.LogEventLevel.Information)
                        .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Serilog.AspNetCore.RequestLoggingMiddleware", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Microsoft.AspNetCore.Mvc.Internal", Serilog.Events.LogEventLevel.Warning)
                        .MinimumLevel.Override("Microsoft.AspNetCore.Authentication", Serilog.Events.LogEventLevel.Warning);
                })
                .UseStartup<Startup>();
        }
    }
}
