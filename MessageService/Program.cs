using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.EventLog;
using System;
using System.IO;
using System.Threading;

namespace MessageService
{
    class Program
    {        
        public static void Main(string[] args)
        {
            Console.WriteLine("Starting application...");
            Console.WriteLine("Ctrl+S - Send Message");
            Console.WriteLine("Ctrl+L - List Messages");
            Console.WriteLine("Ctrl+P - Start Auto Ping");            

            while (true)
            {
                ConsoleKeyInfo info = Console.ReadKey();
                if (info.Modifiers == ConsoleModifiers.Control && info.Key == ConsoleKey.S)
                {
                    Console.WriteLine("Enter your message:");
                    string messy = Console.ReadLine();
                    Messenger.Test.message.SendMessage(messy);
                }                
                if (info.Modifiers == ConsoleModifiers.Control && info.Key == ConsoleKey.L)
                {
                    var test = new Message(Messenger.Test.message);
                    test.ShowMessages();
                }
                if (info.Modifiers == ConsoleModifiers.Control && info.Key == ConsoleKey.P)
                {
                    CreateHostBuilder(args).Build().Run();
                } 
            }
        }

        // add services here
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args).ConfigureServices((hostContext, services) =>
            {
                services.AddHostedService<Worker>().Configure<EventLogSettings>(config =>
                {
                    config.LogName = "Worker Service";
                    config.SourceName = "Worker.cs";
                });                
            });
    }
}
