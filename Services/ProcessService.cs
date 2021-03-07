using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Services
{
    public partial class ProcessService : BackgroundService
    {
        private ILogger<ProcessService> _logger;
        private readonly IServiceScopeFactory _serviceProvider;
        private readonly AppOptions _appOptions;
        public static readonly string ContainerName = "automatestWorker";

        public ProcessService(ILogger<ProcessService> logger, IServiceScopeFactory serviceProvider, AppOptions appOptions)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _appOptions = appOptions;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            return Task.Run(async () =>
            {
                _logger.LogInformation("ProcessService is starting.");

                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    _logger.LogWarning("Current OS cannot be used as a worker for now.");
                }
                else
                {
                    var dockerPurge = ProcessUtils
                        .Popen($"docker rm -f {ContainerName}");

                    var dockerStart = ProcessUtils
                        .Popen($"docker run -di --name {ContainerName} {_appOptions.DockerOptions.Args} {_appOptions.DockerOptions.Image}");

                    // TODO: configurable period
                    while (stoppingToken.IsCancellationRequested == false)
                    {
                        await DoWork();
                        await Task.Delay(5 * 1000, stoppingToken);
                    }
                }
            });
        }

        private async Task DoWork()
        {

            _logger.LogDebug("checking db");
            using (var scope = _serviceProvider.CreateScope())
            {
                var provider = scope.ServiceProvider;
                var dbService = provider.GetService<DbService>();

                var cursor = await dbService.Data
                    .FindAsync(i => i.Result.Status == ProcessStatus.InQueue.Value);

                var items = await cursor
                    .ToListAsync();

                if (items.Any())
                {
                    _logger.LogInformation($"Found {items.Count} items to process");
                }
                else
                {
                    _logger.LogDebug($"Found {items.Count} items to process");
                }

                foreach (var item in items)
                {

                    try
                    {
                        var processItem = new ProcessItem(
                            provider.GetService<ILogger<ProcessItem>>(),
                            provider.GetService<CourseService>(),
                            provider.GetService<LanguageService>(),
                            provider.GetService<IdService>(),
                            provider.GetService<AppOptions>(),
                            provider.GetService<IHubContext<LiveHub>>(),
                            provider.GetService<CompareService>(),
                            provider.GetService<MatlabServer>(),
                            item
                        );

                        if (item.Action == "solve")
                        {
                            _logger.LogInformation("Executing: {Item}", item);
                            var itemResult = await processItem.Solve();

                            _logger.LogInformation("Item Done: {Item}", item);
                            await ResultsUtils.SaveItemAsync(dbService, item);
                        }

                        else if (item.Action == "input")
                        {
                            _logger.LogInformation("Executing: {Item}", item);
                            var itemResult = await processItem.GenerateInput();

                            _logger.LogInformation("Item Done: {Item}", item);
                            await ResultsUtils.SaveItemAsync(dbService, item);
                        }
                        else if (item.Action == "output")
                        {
                            _logger.LogInformation("Executing: {Item}", item);
                            var itemResult = await processItem.GenerateOutput();

                            _logger.LogInformation("Item Done: {Item}", item);
                            await ResultsUtils.SaveItemAsync(dbService, item);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error while processing solution {item}", item.ToString());
                        continue;
                    }
                }
            }
        }
    }
}