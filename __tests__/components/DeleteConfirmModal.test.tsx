import "../setupDom";
import React from "react";
import { describe, it, afterEach } from "node:test";
import assert from "node:assert";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

describe("DeleteConfirmModal component", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    assert.strictEqual(container.firstChild, null);
  });

  it("renders itemTitle and fires onCancel when Cancel button is clicked", () => {
    let cancelCalled = false;
    let confirmCalled = false;

    render(
      <DeleteConfirmModal
        isOpen={true}
        itemTitle="Lease Agreement 2026.pdf"
        onConfirm={() => { confirmCalled = true; }}
        onCancel={() => { cancelCalled = true; }}
      />
    );

    assert.ok(screen.getByText(/Lease Agreement 2026.pdf/i));

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);
    assert.strictEqual(cancelCalled, true);
    assert.strictEqual(confirmCalled, false);
  });

  it("fires onConfirm when Delete button is clicked", () => {
    let confirmCalled = false;

    render(
      <DeleteConfirmModal
        isOpen={true}
        itemTitle="Notice.pdf"
        onConfirm={() => { confirmCalled = true; }}
        onCancel={() => {}}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete consultation/i });
    fireEvent.click(deleteButton);
    assert.strictEqual(confirmCalled, true);
  });

  it("fires onCancel when Escape key is pressed", () => {
    let cancelCalled = false;

    render(
      <DeleteConfirmModal
        isOpen={true}
        itemTitle="Notice.pdf"
        onConfirm={() => {}}
        onCancel={() => { cancelCalled = true; }}
      />
    );

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    assert.strictEqual(cancelCalled, true);
  });

  it("disables buttons and shows deleting status when isDeleting is true", () => {
    let cancelCalled = false;

    render(
      <DeleteConfirmModal
        isOpen={true}
        itemTitle="Notice.pdf"
        isDeleting={true}
        onConfirm={() => {}}
        onCancel={() => { cancelCalled = true; }}
      />
    );

    assert.ok(screen.getByText(/deleting.../i));

    const cancelButton = screen.getByRole("button", { name: /cancel/i }) as HTMLButtonElement;
    const deleteButton = screen.getByRole("button", { name: /deleting.../i }) as HTMLButtonElement;

    assert.strictEqual(cancelButton.disabled, true);
    assert.strictEqual(deleteButton.disabled, true);

    // Escape key should NOT trigger onCancel while deleting
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    assert.strictEqual(cancelCalled, false);
  });
});
