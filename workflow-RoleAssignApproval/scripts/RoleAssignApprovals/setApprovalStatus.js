var userTaskDecision = $.usertasks.usertask1.last.decision;

if(userTaskDecision.toLowerCase() === 'approved')
    $.context.Status = "Approved";
else
    $.context.Status = "Rejected";