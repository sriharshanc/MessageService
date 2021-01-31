using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace MessageService
{
    public class MessageStorage : IMessageStorage, IResponse
    {
        private readonly object _locker = new object();

        private List<string> Messages { get; set; } = new List<string>();
        public IEnumerator<string> GetEnumerator()
        {
            return Messages.GetEnumerator();
        }
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
        public Task SendMessage(string message)
        {
            lock (_locker)
            {
                if (message != null)
                    Messages.Add(message);
                Acknowledge();
            }
            return Task.CompletedTask;
        }

        public void Acknowledge()
        {
            Console.WriteLine("Message sent!");
        }
    }
}
