using System.Threading.Channels;
using PIED_LMS.Contract.Abstractions.BackgroundTasks;

namespace PIED_LMS.Infrastructure.BackgroundTasks;

public sealed class BackgroundEmailQueue : IBackgroundEmailQueue
{
    private readonly Channel<EmailJob> _queue;

    public BackgroundEmailQueue(int capacity = 100)
    {
        var options = new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<EmailJob>(options);
    }

    public async ValueTask EnqueueEmailAsync(EmailJob job)
    {
        ArgumentNullException.ThrowIfNull(job);
        await _queue.Writer.WriteAsync(job);
    }

    public async ValueTask<EmailJob> DequeueEmailAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
