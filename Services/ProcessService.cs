using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Services
{
    public class ProcessService : BackgroundService
    {
        private ILogger<ProcessService> _logger;
        private IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<LiveHub> _liveHub;

        public ProcessService(ILogger<ProcessService> logger, IServiceScopeFactory scopeFactory, IHubContext<LiveHub> liveHub)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
            _liveHub = liveHub;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            return Task.Run(async () =>
            {
                _logger.LogInformation("ProcessService is starting.");

                // TODO: configurable period
                while (stoppingToken.IsCancellationRequested == false)
                {
                    await DoWork();
                    await Task.Delay(5 * 1000, stoppingToken);
                }
            });
        }

        private async Task ProcessOne(CcData item, IServiceProvider serviceProvider)
        {
            var dbService = serviceProvider.GetService<DbService>();
            var idService = serviceProvider.GetService<IdService>();
            var liveHub = serviceProvider.GetService<LiveHub>();
            var courseService = serviceProvider.GetService<CourseService>();
            var languageService = serviceProvider.GetService<LanguageService>();

            var client = idService.UserMap.GetValueByKeyOrNull(item.id);

            var course = courseService[item.courseName][item.courseYear];
            var problem = course[item.problem];
            var random = new Random();

            item.result.status = CCDataStatuses.Running;
            item.results = new List<CcDataResult>();

            foreach (var test in problem.tests)
            {
                foreach (var subtest in test.Enumerate())
                {
                    item.results.Add(new CcDataResult()
                    {
                        caseId = subtest.id,
                        status = CCDataStatuses.InQueue,
                    });
                }
            }

            if (client != null)
            {
                await LiveHub.OnProcessStart(client, item);
            }

            await dbService.Data
                .ReplaceOneAsync(i => i.id == item.id, item);


            foreach (var result in item.results)
            {
                Thread.Sleep(1000);
                result.status = random.NextDouble() > 0.5
                    ? CCDataStatuses.AnswerCorrect
                    : CCDataStatuses.AnswerWrong;

                if (client != null)
                {
                    await LiveHub.OnProcessStart(client, item);
                }

                await dbService.Data
                    .ReplaceOneAsync(i => i.id == item.id, item);
            }
        }

        private async Task DoWork()
        {
            _logger.LogInformation("checking db");

            using (var scope = _scopeFactory.CreateScope())
            {
                var serviceProvider = scope.ServiceProvider;
                var dbService = serviceProvider.GetService<DbService>();
                var idService = serviceProvider.GetService<IdService>();
                var liveHub = serviceProvider.GetService<LiveHub>();
                var courseService = serviceProvider.GetService<CourseService>();
                var languageService = serviceProvider.GetService<LanguageService>();

                var cursor = await dbService.Data
                    .FindAsync(i => i.result.status == CCDataStatuses.InQueue);

                var items = await cursor
                    .ToListAsync();

                _logger.LogInformation($"Found {items.Count} items to process");

                foreach (var item in items)
                {
                    var client = idService.UserMap.GetValueByKeyOrNull(item.id);

                    if (client != null)
                    {
                        try
                        {
                            await LiveHub.NotifyClient(client, $"Attempt #{item.attempt} now running", "error");
                            await LiveHub.OnProcessStart(client, item);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e);
                        }
                    }

                    await ProcessOne(item, serviceProvider);
                }
            }
        }
    }
}