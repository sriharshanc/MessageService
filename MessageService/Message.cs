using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MessageService
{
    public class Message
    {
        private readonly IMessageStorage _message;

        public Message(IMessageStorage message)
        {
            _message = message;
        }

        public void ShowMessages()
        {            
            _message.ToList().ForEach(Console.WriteLine);
        }
    }
}
