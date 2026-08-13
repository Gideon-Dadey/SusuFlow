import { answerSupportQuestion } from "./support-assistant";

describe("answerSupportQuestion", () => {
  it("answers deposit questions", () => {
    const result = answerSupportQuestion("How do I make a deposit?");
    expect(result.escalate).toBe(false);
    expect(result.answer.toLowerCase()).toContain("deposit");
  });

  it("escalates unknown questions", () => {
    const result = answerSupportQuestion("zxqwv unrelated gibberish 999");
    expect(result.escalate).toBe(true);
    expect(result.answer.toLowerCase()).toContain("contact support");
  });

  it("refuses live balance requests with a safe answer", () => {
    const result = answerSupportQuestion("What is my balance right now?");
    expect(result.escalate).toBe(false);
    expect(result.answer.toLowerCase()).toMatch(/balance|home/);
  });
});
