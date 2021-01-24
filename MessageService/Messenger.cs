using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MessageService
{
    public sealed class Messenger
    {
        public static Messenger Test { get; } = new Messenger() { message = new MessageStorage() };

        public IMessageStorage message { get; set; }        
    }
}