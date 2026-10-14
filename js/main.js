document.addEventListener("DOMContentLoaded", () => {
  const currentUser = StorageManager.getCurrentUser();
  UI.initLayout("index.html", "Bảng điều khiển Nhân sự mới");
  renderDashboardData();
});

function renderDashboardData() {
  const user = StorageManager.getCurrentUser();
  const hire = StorageManager.getNewHire(user.id) || StorageManager.getNewHires()[0];
  const tasks = StorageManager.getTasks(hire.id || hire.userId);

  const titleEl = document.getElementById("welcome-title");
  if (titleEl) titleEl.textContent = `Xin chào, ${user.name} 👋`;

  const completed = tasks.filter(task => task.status === "completed").length;
  const total = tasks.length || 1;
  const percent = Math.round((completed / total) * 100);

  document.getElementById("stat-progress").textContent = `${percent}%`;
  document.getElementById("stat-tasks-count").textContent = `${completed}/${total} nhiệm vụ hoàn tất`;
  document.getElementById("bar-percent-label").textContent = `${percent}%`;
  document.getElementById("dashboard-progress-bar").style.width = `${percent}%`;

  const pendingTasks = tasks.filter(task => task.status !== "completed").slice(0, 3);
  const listEl = document.getElementById("upcoming-tasks-list");

  if (pendingTasks.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state" style="padding: 2rem 1rem;">
        <div style="font-size: 2rem;">🎉</div>
        <div class="empty-title">Tuyệt vời! Bạn đã hoàn thành tất cả nhiệm vụ!</div>
        <p class="empty-desc">Không còn nhiệm vụ nào tồn đọng. Hãy trao đổi với Mentor để nhận thêm thử thách mới.</p>
      </div>
    `;
  } else {
    listEl.innerHTML = pendingTasks.map(task => `
      <div class="task-item">
        <div class="task-checkbox-custom ${task.status === "completed" ? "checked" : ""}" onclick="toggleTaskQuick('${task.id}')">
          ${task.status === "completed" ? "✓" : ""}
        </div>
        <div class="task-details">
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.description}</div>
          <div class="task-meta">
            <span class="priority-pill priority-${task.priority}">${task.priority.toUpperCase()}</span>
            <span>📅 Hạn: ${task.dueDate}</span>
            <span class="badge badge-neutral">${task.category}</span>
          </div>
        </div>
        <div class="task-actions">
          <a href="../pages/newhire-checklist.html" class="btn btn-outline btn-sm">Chi tiết</a>
        </div>
      </div>
    `).join("");
  }

  const docs = StorageManager.getDocuments().slice(0, 3);
  const docsEl = document.getElementById("quick-docs-list");
  docsEl.innerHTML = docs.map(document => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #f8fafc;">
      <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">
        <div style="font-weight: 600; font-size: 0.85rem;" title="${document.title}">${document.title}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">${document.category} • ${document.format}</div>
      </div>
      <a href="#" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" aria-label="Tài liệu ${document.title}">Đọc</a>
    </div>
  `).join("");
}

function toggleTaskQuick(taskId) {
  StorageManager.toggleTaskStatus(taskId);
  UI.showToast("Cập nhật tiến độ", "Đã thay đổi trạng thái nhiệm vụ!", "success");
  renderDashboardData();
}

function requestCheckinModal() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("req-date").value = tomorrow.toISOString().split("T")[0];
  UI.openModal("checkin-request-modal");
}

function submitCheckinRequest() {
  const date = document.getElementById("req-date").value;
  const topic = document.getElementById("req-topic").value.trim();

  if (!date || !topic) {
    UI.showToast("Thiếu thông tin", "Vui lòng chọn ngày và ghi rõ nội dung trao đổi.", "warning");
    return;
  }

  const user = StorageManager.getCurrentUser();
  StorageManager.addCheckin({
    mentorId: user.mentorId || "mt-01",
    mentorName: user.mentorName || "Lê Hoàng Long",
    newHireId: user.id,
    newHireName: user.name,
    department: user.department,
    date,
    moraleRating: 5,
    status: "scheduled",
    summary: "Yêu cầu gặp gỡ từ Nhân sự mới: " + topic,
    challenges: topic,
    actionItems: "Chờ Mentor xác nhận phòng họp Google Meet",
    nextDate: date
  });

  UI.closeModal("checkin-request-modal");
  UI.showToast("Đã gửi yêu cầu", "Mentor Lê Hoàng Long đã nhận được lời mời check-in!", "success");
}
