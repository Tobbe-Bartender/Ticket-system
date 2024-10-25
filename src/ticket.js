"use strict";

const mysql  = require("promise-mysql");
const config = require("./../config/db/this.json");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: '',
    auth: {
        user: '',
        pass: 'q'
    }
});

async function sendEmail(to, subject, text) {
    let mailOptions = {
        from: '',
        to: to,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}


async function allTickets() {
    const db = await mysql.createConnection(config);
    let sql = `CALL all_Tickets()`;

    let res = await db.query(sql);

    return res[0];
}

async function createTicket(data) {
    const db = await mysql.createConnection(config);
    let sql = `CALL make_ticket(?, ?, ?, ?, ?)`;

    await db.query(sql, [data.t_person, data.t_issue_choice, data.t_issue_explain, data.t_file_path || null, data.t_user_email]);
}

async function changeTicket(data) {
    const db = await mysql.createConnection(config);
    let sql = `UPDATE tickets SET issue_choice = ?, status = ?, issue_explain = ?, agent = ? WHERE ticket_id = ?`;

    await db.query(sql, [data.t_issue_choice, data.t_status, data.t_issue_explain, data.t_agent, data.t_ticket_id]);
}

async function getOne(ticketID) {
    const db = await mysql.createConnection(config);
    let sql = `SELECT * FROM tickets WHERE ticket_id = ?`;

    let res = await db.query(sql, [ticketID]);

    return res[0];
}

async function getComments(ticketID) {
    const db = await mysql.createConnection(config);
    let sql = `SELECT * FROM comments WHERE ticket_id = ? ORDER BY comment_time DESC`;
    let res = await db.query(sql, [ticketID]);
    return res;
}

async function addComment(ticketID, commentText, commentAuthor) {
    const db = await mysql.createConnection(config);
    let sql = `INSERT INTO comments (ticket_id, comment_text, comment_author) VALUES (?, ?, ?)`;
    await db.query(sql, [ticketID, commentText, commentAuthor]);
}

async function getAllTicketsForUser(userEmail, isAgent, sort, order) {
    const db = await mysql.createConnection(config);

    let sql = isAgent
        ? `SELECT * FROM tickets ORDER BY ${sort} ${order}`
        : `SELECT * FROM tickets WHERE user_email = ? ORDER BY ${sort} ${order}`;

    let params = isAgent ? [] : [userEmail];

    let res = await db.query(sql, params);
    return res;
}

async function changeTicketStatus(ticketID, newStatus) {
    const db = await mysql.createConnection(config);
    let sql = `UPDATE tickets SET status = ?, time_last_update = NOW() WHERE ticket_id = ?`;
    await db.query(sql, [newStatus, ticketID]);
}

async function getAllIssueCategories() {
    const db = await mysql.createConnection(config);
    let sql = `SELECT * FROM issue_categories`;
    let res = await db.query(sql);
    return res;
}

async function addIssueCategory(categoryName) {
    const db = await mysql.createConnection(config);
    let sql = `INSERT INTO issue_categories (name) VALUES (?)`;
    await db.query(sql, [categoryName]);
}

async function deleteIssueCategory(categoryId) {
    const db = await mysql.createConnection(config);
    let sql = `DELETE FROM issue_categories WHERE id = ?`;
    await db.query(sql, [categoryId]);
}

async function addKnowledgeEntry(issueType, solution) {
    const db = await mysql.createConnection(config);
    const sql = `INSERT INTO knowledge_base (issue_type, solution) VALUES (?, ?)`;
    await db.query(sql, [issueType, solution]);
}

async function getAllKnowledgeEntries() {
    const db = await mysql.createConnection(config);
    const sql = `SELECT * FROM knowledge_base ORDER BY created_at DESC`;
    const entries = await db.query(sql);
    return entries;
}

async function deleteKnowledgeEntry(entryId) {
    const db = await mysql.createConnection(config);
    const sql = `DELETE FROM knowledge_base WHERE id = ?`;
    await db.query(sql, [entryId]);
}


module.exports = {
    "allTickets": allTickets,
    "createTicket": createTicket,
    "changeTicket": changeTicket,
    "getOne": getOne,
    "getComments": getComments,
    "addComment": addComment,
    "getAllTicketsForUser": getAllTicketsForUser,
    "sendEmail": sendEmail,
    "changeTicketStatus": changeTicketStatus,
    "getAllIssueCategories": getAllIssueCategories,
    "addIssueCategory": addIssueCategory,
    "deleteIssueCategory": deleteIssueCategory,
    "addKnowledgeEntry": addKnowledgeEntry,
    "getAllKnowledgeEntries": getAllKnowledgeEntries,
    "deleteKnowledgeEntry": deleteKnowledgeEntry
};
