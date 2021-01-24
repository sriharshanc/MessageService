using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace MessageService
{
    public class Response : IResponse
    {        
        public Response()
        {
            
        }

        public void Acknowledge()
        {
            Console.WriteLine("Message sent!!!");
        }
    }
}
