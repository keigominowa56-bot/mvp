export function calcAgeFromBirthdate(isoDateString: string): number | null {
  // isoDateString: '2001-05-06' など
  try {
    const dob = new Date(isoDateString);
    if (Number.isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

// 年齢の選択肢（18〜100）
export function ageOptions(min = 18, max = 100): number[] {
  const arr: number[] = [];
  for (let i = min; i <= max; i++) arr.push(i);
  return arr;
}