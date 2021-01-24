using System.Collections.Generic;
using System.Threading.Tasks;

namespace MessageService
{
    public interface IMessageStorage : IEnumerable<string>
    {
        Task SendMessage(string message);
    }
}