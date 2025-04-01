import { LoginForm } from '../login-form'


export function LoginFormAuth() {


  return (
    // <Card className="w-[350px]">
    //   <CardHeader>
    //     <CardTitle>Login</CardTitle>
    //   </CardHeader>
    //   <CardContent>
    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       {error && <div className="text-sm text-red-500">{error}</div>}
    //       <div className="space-y-2">
    //         <Input
    //           id="email"
    //           placeholder="Email"
    //           type="email"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //           required
    //         />
    //       </div>
    //       <div className="space-y-2">
    //         <Input
    //           id="password"
    //           placeholder="Password"
    //           type="password"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           required
    //         />
    //       </div>
    //       <Button type="submit" className="w-full" disabled={isLoading}>
    //         {isLoading ? 'Loading...' : 'Login'}
    //       </Button>
    //       <Button
    //         type="button"
    //         variant="outline"
    //         className="w-full"
    //         onClick={() => navigate('/register')}
    //       >
    //         Create account
    //       </Button>
    //     </form>
    //   </CardContent>
    // </Card>
    <div className="flex min-h-svh flex-col items-center justify-center  p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
