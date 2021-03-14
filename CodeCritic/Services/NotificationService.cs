using System;
using System.Collections.Generic;
using System.Linq;
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
    public partial class NotificationService : BackgroundService
    {
        private ILogger<NotificationService> _logger;
        private readonly IServiceScopeFactory _serviceProvider;
        private readonly AppOptions _appOptions;

        public NotificationService(ILogger<NotificationService> logger, IServiceScopeFactory serviceProvider, AppOptions appOptions)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _appOptions = appOptions;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            return Task.Run(async () =>
            {
                _logger.LogInformation("NotificationService is starting.");

                // TODO: configurable period
                while (stoppingToken.IsCancellationRequested == false)
                {
                    await DoWork();
                    await Task.Delay(5 * 1000, stoppingToken);
                }
            });
        }

        private async Task DoWork()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var provider = scope.ServiceProvider;
                var dbService = provider.GetService<DbService>();
                var hub = provider.GetService<IHubContext<LiveHub>>();
                var idService = provider.GetService<IdService>();

                var allNotifications = await dbService.Events
                    .Find(i => true)
                    .SortByDescending(i => i.Id)
                    .ToListAsync();

                var remaining = idService.All;
                foreach (var notificationGroup in allNotifications.GroupBy(i => i.Reciever))
                {
                    var ids = idService[notificationGroup.Key];
                    remaining.RemoveAll(i => i == notificationGroup.Key);

                    var channels = hub.Clients.Clients(ids);
                    var notifications = notificationGroup.ToList();
                    await channels.NewNotification(notifications);
                }

                foreach(var id in remaining)
                {
                    var ids = idService[id];
                    var channels = hub.Clients.Clients(ids);
                    await channels.NewNotification(new List<CcEvent>{ });
                }

                var itemsCount = await dbService.Data.CountDocumentsAsync(i => i.Result.Status == ProcessStatus.InQueue.Value);
                await hub.Clients.All.QueueStatus(new string[itemsCount]);
            }
        }
    }
}