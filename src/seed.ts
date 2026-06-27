import dotenv from "dotenv";
dotenv.config();

import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./config/env";
import { User, IUser } from "./modules/users/user.model";
import { Content, ContentType } from "./modules/content/content.model";
import { Attachment } from "./modules/uploads/attachment.model";

type AttachmentSeed = {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
};

type ContentSeed = {
  title: string;
  type: ContentType;
  description: string;
  tags: string[];
  attachments?: AttachmentSeed[];
};

const img = (seed: string, w = 800, h = 600): AttachmentSeed => ({
  fileName: `${seed}.jpg`,
  fileUrl: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  fileType: "image/jpeg",
  fileSize: Math.floor(180000 + Math.random() * 200000),
});

const pdf = (name: string): AttachmentSeed => ({
  fileName: `${name}.pdf`,
  fileUrl: `https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf`,
  fileType: "application/pdf",
  fileSize: Math.floor(300000 + Math.random() * 500000),
});

const doc = (name: string): AttachmentSeed => ({
  fileName: `${name}.docx`,
  fileUrl: `https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf`,
  fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  fileSize: Math.floor(100000 + Math.random() * 200000),
});

// ─── Text-only items ──────────────────────────────────────────────────────────

const textItems: ContentSeed[] = [
  {
    title: "Why we pivoted from B2C to B2B",
    type: "THOUGHT",
    description:
      "After 6 months of struggling with CAC, we made the call to pivot. Full breakdown of the decision and what we would do differently.",
    tags: ["pivot", "strategy", "b2b"],
  },
  {
    title: "Cold outbound script — 40% reply rate",
    type: "THOUGHT",
    description:
      "The exact email sequence we used. Personalization framework, subject line formulas, and follow-up cadence.",
    tags: ["sales", "outbound", "growth"],
  },
  {
    title: "Zaploom product vision 2026",
    type: "THOUGHT",
    description:
      "Where we're taking Founder Vault this year. The thesis behind the product and what success looks like by December.",
    tags: ["vision", "product", "strategy"],
  },
  {
    title: "Founder mental health check-in",
    type: "THOUGHT",
    description:
      "What burned me out after a rough Q4 and the three habits that helped me recover heading into the new year.",
    tags: ["mental-health", "wellbeing", "leadership"],
  },
  {
    title: "YC application draft notes",
    type: "THOUGHT",
    description:
      "Raw notes from working through the YC application. Answers that clicked and ones we struggled with.",
    tags: ["yc", "fundraising", "storytelling"],
  },
  {
    title: "AI content tagging — feature idea",
    type: "THOUGHT",
    description:
      "Auto-tag content using Claude based on title + description. Could save founders 2–3 minutes per item. Worth prototyping.",
    tags: ["ai", "features", "idea"],
  },
];

// ─── Items with attachments ───────────────────────────────────────────────────

const attachmentItems: ContentSeed[] = [
  {
    title: "Series A pitch deck review notes",
    type: "MEETING",
    description:
      "Key feedback from 12 investor meetings. Common objections and how we addressed them going into the next round.",
    tags: ["fundraising", "series-a", "pitch"],
    attachments: [
      img("pitch-whiteboard", 1000, 700),
      img("pitch-notes", 900, 600),
      pdf("series-a-deck-v4"),
    ],
  },
  {
    title: "Product roadmap Q1 2026",
    type: "DOCUMENT",
    description:
      "Full roadmap with priorities, timelines, and owner assignments across product, eng, and design.",
    tags: ["roadmap", "product", "planning"],
    attachments: [pdf("roadmap-q1-2026"), img("roadmap-board", 1200, 800)],
  },
  {
    title: "Team lunch Mumbai — Feb 2026",
    type: "EVENT",
    description:
      "First in-person team meetup. 6 people, 3 cities. Huge energy boost after 4 months remote.",
    tags: ["team", "culture", "in-person"],
    attachments: [img("team-lunch-mumbai", 1200, 800), img("team-group-photo", 1000, 700)],
  },
  {
    title: "Technical architecture v2",
    type: "DOCUMENT",
    description:
      "Updated system design after scaling issues in January. New queue-based upload pipeline and CDN strategy.",
    tags: ["engineering", "architecture", "scaling"],
    attachments: [img("arch-diagram", 1400, 900), pdf("technical-architecture-v2")],
  },
  {
    title: "Investor meeting — Sequoia Capital",
    type: "MEETING",
    description:
      "First call with partner at Sequoia. Very warm. They want to see 3-month traction before next meeting.",
    tags: ["fundraising", "sequoia", "investors"],
    attachments: [img("sequoia-meeting", 900, 600), pdf("zaploom-pitch-deck-v2")],
  },
  {
    title: "Competitive analysis — dev tooling space",
    type: "DOCUMENT",
    description:
      "Analysis of 15 competitors across 4 segments. Includes pricing, positioning, and our differentiation matrix.",
    tags: ["research", "competitive", "strategy"],
    attachments: [pdf("competitive-analysis-2026")],
  },
  {
    title: "Customer discovery — Acme Corp",
    type: "MEETING",
    description:
      "30-min discovery with VP of Engineering. Key pain points around deployment pipelines and their current workaround.",
    tags: ["customer", "discovery", "b2b"],
    attachments: [img("discovery-whiteboard", 900, 600), doc("acme-discovery-notes")],
  },
  {
    title: "GTM strategy for Southeast Asia expansion",
    type: "DOCUMENT",
    description:
      "Market sizing, partner strategy, and 90-day launch timeline for Singapore and Indonesia markets.",
    tags: ["gtm", "expansion", "asia"],
    attachments: [pdf("gtm-asia-strategy"), img("asia-market-map", 1000, 700)],
  },
  {
    title: "All-hands January 2026",
    type: "EVENT",
    description:
      "Company kickoff for 2026. Vision alignment, OKRs, and team updates across all departments.",
    tags: ["team", "allhands", "culture"],
    attachments: [
      img("allhands-team", 1200, 800),
      img("allhands-stage", 1000, 700),
      img("allhands-dinner", 900, 600),
    ],
  },
  {
    title: "Board meeting — March 2026",
    type: "MEETING",
    description: "Q1 metrics review, burn rate analysis, and strategic priorities for H1 2026.",
    tags: ["board", "metrics", "fundraising"],
    attachments: [img("board-slides", 1200, 800), pdf("board-deck-march-2026")],
  },
];

// ─── Seed helper ──────────────────────────────────────────────────────────────

async function seedContent(ownerId: Types.ObjectId, items: ContentSeed[]) {
  for (const item of items) {
    const content = await Content.create({
      ownerId,
      title: item.title,
      description: item.description,
      type: item.type,
      tags: item.tags,
      attachmentIds: [],
    });

    if (item.attachments && item.attachments.length > 0) {
      const attachmentDocs = await Attachment.insertMany(
        item.attachments.map((a) => ({
          contentId: content._id,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
          storageKey: `seed/${a.fileName}`,
        }))
      );
      await Content.updateOne(
        { _id: content._id },
        { $set: { attachmentIds: attachmentDocs.map((a) => a._id) } }
      );
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB");

  const passwordHash = await bcrypt.hash("password123", 10);

  const mainUser = await User.findOneAndUpdate(
    { email: "singhkapil708@gmail.com" },
    {
      $set: {
        name: "Kapil Singh",
        companyName: "Zaploom",
        designation: "Founder & CEO",
        bio: "Building the future of content management for founders.",
        isActive: true,
      },
      $setOnInsert: { email: "singhkapil708@gmail.com", passwordHash },
    },
    { upsert: true, new: true }
  ) as IUser;
  console.log(`✓ User: ${mainUser.email}`);

  const adminUser = await User.findOneAndUpdate(
    { email: "admin@admin.com" },
    {
      $set: {
        name: "Rohan Mehta",
        companyName: "Nexus Ventures",
        designation: "Co-founder & CTO",
        bio: "Building products at the intersection of AI and developer tooling.",
        isActive: true,
      },
      $setOnInsert: { email: "admin@admin.com", passwordHash },
    },
    { upsert: true, new: true }
  ) as IUser;
  console.log(`✓ User: ${adminUser.email}`);

  // Clear existing content and attachments for both users
  for (const user of [mainUser, adminUser]) {
    const existing = await Content.find({ ownerId: user._id });
    await Attachment.deleteMany({ contentId: { $in: existing.map((c) => c._id) } });
    await Content.deleteMany({ ownerId: user._id });
  }

  for (const user of [mainUser, adminUser]) {
    await seedContent(user._id as Types.ObjectId, textItems);
    await seedContent(user._id as Types.ObjectId, attachmentItems);
    console.log(`✓ Content seeded for: ${user.email}`);
  }

  console.log(`\nLogins:`);
  console.log(`  singhkapil708@gmail.com / password123`);
  console.log(`  admin@admin.com / password123`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
