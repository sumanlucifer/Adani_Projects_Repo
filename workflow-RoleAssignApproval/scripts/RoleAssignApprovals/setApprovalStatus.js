var userTaskDecision = $.usertasks.usertask1.last.decision;

if(userTaskDecision.toLowerCase() === 'approve')
    $.context.Status = "Approved";
else
    $.context.Status = "Rejected";