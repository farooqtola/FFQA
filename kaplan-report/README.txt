KAPLAN REPORT — final install (no pasting into the middle of big files)

STEP 1  Apps Script > + > Script  > name it  KaplanReport   > paste ALL of KaplanReport.gs > save.
STEP 2  Apps Script > + > HTML    > name it  KaplanJS       > select all, delete, paste ALL of KaplanJS.html > save.
        (It is plain JavaScript, no <script> tags. Do not add any.)

STEP 3  Three tiny edits in Index.html:
  a) Just BEFORE the line   /* ================= REPORT CARD ================= */
     add this one line:
        <?!= HtmlService.createHtmlOutputFromFile('KaplanJS').getContent() ?>
  b) In buildNav(), change   ['a-qsync','🔄','Quiz Sync']
     to                      ['a-qsync','🔄','Quiz Sync'],['a-kap','🎥','Kaplan Report']
  c) In go(), inside   var V={ ... }   add   'a-kap':vAKap,
     e.g. right after  'a-qsync':vAQSync,

STEP 4  Deploy > Manage deployments > Edit > Version: New version > Deploy.
(PORTAL_VERSION / CLIENT_VERSION do not need to change.)
