import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractMessages } from "../app/messages/messageUtils";

describe("iOS messageUtils", () => {
  it("normalizes action objects from paged items", () => {
    const messages = extractMessages({
      items: [
        {
          id: "msg-1",
          title: "Verify email",
          action: {
            title: "Open inbox",
            href: "https://example.com/inbox",
          },
        },
      ],
    });

    assert.deepEqual(messages, [
      {
        id: "msg-1",
        title: "Verify email",
        action: {
          title: "Open inbox",
          href: "https://example.com/inbox",
        },
        action_label: "Open inbox",
        action_url: "https://example.com/inbox",
      },
    ]);
  });

  it("deduplicates ids across messages and items", () => {
    const messages = extractMessages({
      messages: [{ id: "msg-1", title: "First" }],
      items: [
        { id: "msg-1", title: "Duplicate" },
        { id: "msg-2", title: "Second" },
      ],
    });

    assert.equal(messages.length, 2);
    assert.equal(messages[0]?.title, "First");
    assert.equal(messages[1]?.title, "Second");
  });
});
