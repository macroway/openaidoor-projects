/**
 * 封装后端 API 调用。
 */

const API_BASE = '/api';

/**
 * 上传图片文件。
 * @param {File[]} files - 要上传的文件列表
 * @returns {Promise<{files: Array<{file_id: string, filename: string, size: number, content_type: string}>}>}
 */
export async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '上传失败' }));
    throw new Error(error.detail || `上传失败: ${response.status}`);
  }

  return response.json();
}

/**
 * 删除已上传文件。
 * @param {string} fileId - 文件 ID
 * @returns {Promise<{message: string, file_id: string}>}
 */
export async function deleteFile(fileId) {
  const response = await fetch(`${API_BASE}/upload/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '删除失败' }));
    throw new Error(error.detail || `删除失败: ${response.status}`);
  }

  return response.json();
}

/**
 * 获取所有已上传文件列表。
 * @returns {Promise<{files: Array<{file_id: string, filename: string, size: number, content_type: string}>}>}
 */
export async function listFiles() {
  const response = await fetch(`${API_BASE}/upload`);

  if (!response.ok) {
    throw new Error(`获取文件列表失败: ${response.status}`);
  }

  return response.json();
}

/**
 * 健康检查。
 * @returns {Promise<{status: string}>}
 */
export async function healthCheck() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

/**
 * 开始处理任务。
 * @param {string[]} fileIds - 文件 ID 列表
 * @returns {Promise<{task_id: string, total_images: number}>}
 */
export async function startProcess(fileIds) {
  const response = await fetch(`${API_BASE}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_ids: fileIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '启动失败' }));
    throw new Error(error.detail || `启动失败: ${response.status}`);
  }

  return response.json();
}

/**
 * 查询任务进度。
 * @param {string} taskId - 任务 ID
 * @returns {Promise<{task_id: string, status: string, total_images: number, processed_images: number, progress: number}>}
 */
export async function getTaskStatus(taskId) {
  const response = await fetch(`${API_BASE}/task/${taskId}/status`);

  if (!response.ok) {
    throw new Error(`查询进度失败: ${response.status}`);
  }

  return response.json();
}

/**
 * 获取任务结果。
 * @param {string} taskId - 任务 ID
 * @returns {Promise<{task_id: string, records: Array, confirm_items: Array}>}
 */
export async function getTaskResult(taskId) {
  const response = await fetch(`${API_BASE}/task/${taskId}/result`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '获取结果失败' }));
    throw new Error(error.detail || `获取结果失败: ${response.status}`);
  }

  return response.json();
}

/**
 * 导出 Excel 文件。
 * @param {Array} records - 询价记录
 * @param {Array} confirmItems - 确认问题
 * @returns {Promise<void>} 触发浏览器下载
 */
export async function exportExcel(records, confirmItems) {
  const response = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records, confirm_items: confirmItems }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '导出失败' }));
    throw new Error(error.detail || `导出失败: ${response.status}`);
  }

  // 触发浏览器下载
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const disposition = response.headers.get('Content-Disposition');
  const filename = disposition
    ? disposition.split('filename="')[1]?.split('"')[0]
    : '询价整理.xlsx';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
