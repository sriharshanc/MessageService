using System;
using System.Collections.Generic;
using System.Text;

namespace MessageService
{
    public class Messages
    {
        private readonly IMessageStorage _messageStorage;

        public Messages(IMessageStorage messageStorage)
        {
            _messageStorage = messageStorage;
        }
    }
}
