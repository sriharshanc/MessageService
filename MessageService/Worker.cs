using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MessageService
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;

        public Worker(ILogger<Worker> logger)
        {
            _logger = logger;
        }
        protected override async Task ExecuteAsync(CancellationToken cancellationtoken)
        {
            while (!cancellationtoken.IsCancellationRequested)
            {
                //_logger.LogInformation("Background worker running at: {time}", DateTimeOffset.Now);
                await Messenger.Test.message.SendMessage(DateTimeOffset.Now.ToString());
                await Task.Delay(1000, cancellationtoken);
            }
        }        
    }
}