import { motion } from 'framer-motion';

const Loading = () => {
  const colors = { primary: '#0d9488' };
  return (
    <div className='w-full h-screen flex justify-center items-center bg-white/80 backdrop-blur-sm fixed inset-0 z-[9999]'>
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-8 w-8 border-t-2 border-b-2"
          style={{ borderColor: colors.primary }}
        />
      </div>
    </div>
  )
}

export default Loading