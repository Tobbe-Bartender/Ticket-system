const express = require("express");
const router = express.Router();
const ticket = require("./../src/ticket.js");
const multer = require('multer');
const path = require('path');
const { sendEmail } = require('./../src/ticket.js'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", (req, res) => {
    res.render("ticketsystem/home.ejs", { oidc: req.oidc });
});

router.get("/login", (req, res) => {
    res.render("ticketsystem/login.ejs", { oidc: req.oidc });
});

router.get("/createticket", async (req, res) => {
    try {
        const issueCategories = await ticket.getAllIssueCategories();
        res.render("ticketsystem/createticket.ejs", { issueCategories, oidc: req.oidc });
    } catch (error) {
        console.error("Error fetching issue categories:", error);
        res.status(500).send("An error occurred while fetching issue categories.");
    }
});

router.post("/createticket", (req, res) => {
    upload.single('ticket_file')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send('File size exceeds the 5MB limit.');
            }
            return res.status(400).send('A Multer error occurred while uploading the file.');
        } else if (err) {
            return res.status(500).send('An error occurred during file upload.');
        }

        try {
            const data = req.body;
            const file = req.file;

            data.t_user_email = req.oidc.user.email;

            if (file) {
                data.t_file_path = '/uploads/' + file.filename;
            }

            await ticket.createTicket(data);
            
            res.redirect("/tickets");
        } catch (dbError) {
            console.error(dbError);
            res.status(500).send('An error occurred while creating the ticket.');
        }
    });
});

router.get("/tickets", async (req, res) => {
    const validSortColumns = ['ticket_id', 'person', 'issue_choice', 'agent', 'status', 'time_created', 'time_last_update', 'user_email'];
    const sort = validSortColumns.includes(req.query.sort) ? req.query.sort : 'ticket_id';
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    let data = {};
    data.title = "All tickets";
    data.sort = sort;
    data.order = order;

    const userEmail = req.oidc.user.email;
    const userRoles = req.oidc.user['http://localhost:1337/roles'] || [];

    data.allTickets = await ticket.getAllTicketsForUser(userEmail, userRoles.includes('Agent'), sort, order);

    res.render("ticketsystem/tickets.ejs", { oidc: req.oidc, ...data });
});


router.get("/inspect/:ticket_id", async (req, res) => {
    let data = {};
    data.title = "Inspect Ticket";
    
    const ticketDetails = await ticket.getOne(req.params.ticket_id);
    data.ticket = ticketDetails;

    const comments = await ticket.getComments(req.params.ticket_id);
    data.comments = comments;

    res.render("ticketsystem/inspect.ejs", { oidc: req.oidc, ...data });
});

router.post("/addcomment", async (req, res) => {
    try {
        const { ticket_id, comment_text, comment_author } = req.body;

        await ticket.addComment(ticket_id, comment_text, comment_author);

        const ticketDetails = await ticket.getOne(ticket_id);
        const ticketCreatorEmail = ticketDetails.user_email;

        await sendEmail(ticketCreatorEmail, `New Comment on Your Ticket #${ticket_id}`, `A new comment was added by ${comment_author}:\n\n${comment_text}`);

        res.redirect(`/inspect/${ticket_id}`);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).send("An error occurred while adding the comment.");
    }
});


router.get("/changeticket/:ticket_id", async (req, res) => {
    let data = {};
    data.title = "Change ticket";

    data.one = await ticket.getOne(req.params.ticket_id);
    
    data.issueCategories = await ticket.getAllIssueCategories();
    
    res.render("ticketsystem/changeticket.ejs", { oidc: req.oidc, ...data });
});

router.post("/changeticket", async (req, res) => {
    const roles = req.oidc.user['http://localhost:1337/roles'] || [];
    const { t_ticket_id, t_issue_choice, t_issue_explain, t_status, t_agent } = req.body;

    try {
        const currentTicket = await ticket.getOne(t_ticket_id);

        const changesMadeByUser = currentTicket.issue_explain !== t_issue_explain;

        const changesMadeByAgent = (
            roles.includes('Agent') && (
                currentTicket.issue_choice !== t_issue_choice ||
                currentTicket.status !== t_status ||
                currentTicket.agent !== t_agent
            )
        );

        await ticket.changeTicket({
            t_ticket_id,
            t_issue_choice: changesMadeByAgent ? t_issue_choice : currentTicket.issue_choice,
            t_issue_explain,
            t_status: changesMadeByAgent ? t_status : currentTicket.status,
            t_agent: changesMadeByAgent ? t_agent : currentTicket.agent
        });

        if (changesMadeByAgent) {
            const ticketCreatorEmail = currentTicket.user_email;

            await sendEmail(
                ticketCreatorEmail,
                `Ticket #${t_ticket_id} Updated`,
                `Hello ${currentTicket.person},\n\nYour ticket (ID: ${t_ticket_id}) has been updated. The current status is: ${t_status}.\n\nBest Regards,\nSupport Team`
            );
        }

        res.redirect("/tickets");
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).send("An error occurred while updating the ticket.");
    }
});


router.post("/changeStatus", async (req, res) => {
    try {
        const { ticket_id, t_status } = req.body;

        await ticket.changeTicketStatus(ticket_id, t_status);

        const ticketDetails = await ticket.getOne(ticket_id);
        const ticketCreatorEmail = ticketDetails.user_email;
        await sendEmail(ticketCreatorEmail, `Status Update for Your Ticket #${ticket_id}`, `The status of your ticket has been updated to: ${t_status}.`);

        res.redirect("/tickets");
    } catch (error) {
        console.error("Error updating ticket status:", error);
        res.status(500).send("An error occurred while updating the ticket status.");
    }
});

router.get("/admin", async (req, res) => {
    const roles = req.oidc.user['http://localhost:1337/roles'];
  
    if (roles.includes('Agent')) {
        try {
            const issue_category = await ticket.getAllIssueCategories();

            res.render("ticketsystem/admin", { oidc: req.oidc, issue_category });
        } catch (error) {
            console.error("Error fetching issue categories:", error);
            res.status(500).send("An error occurred while fetching issue categories.");
        }
    } else {
        res.status(403).send('Access Denied: Agents Only');
    }
});

router.post("/admin/addissuecategory", async (req, res) => {
    try {
        const { issue_category } = req.body;

        await ticket.addIssueCategory(issue_category);

        res.redirect("/admin");
    } catch (error) {
        console.error("Error adding issue category:", error);
        res.status(500).send("An error occurred while adding the issue category.");
    }
});

router.post("/admin/deletecategory", async (req, res) => {
    try {
        const { category_id } = req.body;

        await ticket.deleteIssueCategory(category_id);

        res.redirect("/admin");
    } catch (error) {
        console.error("Error deleting issue category:", error);
        res.status(500).send("An error occurred while deleting the issue category.");
    }
});

router.get("/knowledgebase", async (req, res) => {
    const roles = req.oidc.user['http://localhost:1337/roles'];
  
    if (roles.includes('Agent')) {
        try {
            const knowledgeEntries = await ticket.getAllKnowledgeEntries();
            res.render("ticketsystem/knowledgebase", { oidc: req.oidc, knowledgeEntries });
        } catch (error) {
            console.error("Error fetching knowledge base entries:", error);
            res.status(500).send("An error occurred while fetching knowledge base entries.");
        }
    } else {
        res.status(403).send('Access Denied: Agents Only');
    }
});

router.post("/knowledgebase/add", async (req, res) => {
    try {
        const { issue_type, solution } = req.body;

        await ticket.addKnowledgeEntry(issue_type, solution);

        res.redirect("/knowledgebase");
    } catch (error) {
        console.error("Error adding knowledge base entry:", error);
        res.status(500).send("An error occurred while adding the knowledge base entry.");
    }
});

router.post("/knowledgebase/delete", async (req, res) => {
    try {
        const { entry_id } = req.body;

        await ticket.deleteKnowledgeEntry(entry_id);

        res.redirect("/knowledgebase");
    } catch (error) {
        console.error("Error deleting knowledge base entry:", error);
        res.status(500).send("An error occurred while deleting the knowledge base entry.");
    }
});



module.exports = router;