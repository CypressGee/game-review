import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NoUser } from "@/components/NoUser";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await currentUser();

  async function handleAddProfile(formData) {
    "use server";
    const bio = formData.get("bio");
    const username = formData.get("username");

    await db.query(
      `INSERT INTO profiles (clerk_id, username, bio) VALUES ($1, $2, $3)`,
      [user?.id, username, bio]
    );

    revalidatePath("/profile");
  }

  if (!user) {
    return <p>Please sign in</p>;
  }

  const response = await db.query(
    `SELECT * FROM profiles WHERE clerk_id = $1`,
    [user.id]
  );

  if (response.rowCount === 0) {
    return (
      <div>
        <h2>Please Create your profile</h2>
        <form action={handleAddProfile}>
          <input name="username" placeholder="Username" />
          <input name="bio" placeholder="Bio" />
          <button>Create Profile</button>
        </form>
      </div>
    );
  }

  const profile = response.rows[0];

  return (
    <div>
      <h2>{profile.username}</h2>
      <p>{profile.bio}</p>
    </div>
  );
}
